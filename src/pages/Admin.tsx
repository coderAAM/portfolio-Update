import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PROFILE, SOCIAL_LINKS, SKILLS, EDUCATION } from "@/lib/constants";
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
  Mail,
  Camera,
  Upload,
  MessageSquare,
  Eye,
  Save,
  TrendingUp,
  Sparkles,
  Bot,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AIContentSuggestion } from "@/components/AIContentSuggestion";
import { AIExperienceSuggestion } from "@/components/AIExperienceSuggestion";
import { VisitorGraph } from "@/components/admin/VisitorGraph";
import { SortableExperienceItem } from "@/components/admin/SortableExperienceItem";
import { ChatExport } from "@/components/admin/ChatExport";
import { SkillsManager } from "@/components/admin/SkillsManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { FileText } from "lucide-react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface ProfileSettings {
  id?: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  summary: string;
  github_url: string;
  linkedin_url: string;
  image_url: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string[];
  sort_order: number;
}

interface ChatConversation {
  id: string;
  visitor_id: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpDialogOpen, setIsExpDialogOpen] = useState(false);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Admin access password verification state
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    technologies: "",
    github_url: "",
    live_url: "",
    featured: false,
  });

  const [expFormData, setExpFormData] = useState({
    title: "",
    company: "",
    period: "",
    description: "",
  });

  const [profileData, setProfileData] = useState<ProfileSettings>({
    name: PROFILE.name,
    title: PROFILE.title,
    email: PROFILE.email,
    phone: PROFILE.phone,
    location: PROFILE.location,
    website: PROFILE.website || "",
    summary: PROFILE.summary,
    github_url: SOCIAL_LINKS.github,
    linkedin_url: SOCIAL_LINKS.linkedin,
    image_url: "",
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

  // Session timeout effect
  useEffect(() => {
    if (!isAdminVerified) return;
    
    const checkTimeout = () => {
      if (Date.now() - lastActivityTime > SESSION_TIMEOUT_MS) {
        setIsAdminVerified(false);
        toast({ 
          title: "Session expired", 
          description: "Please re-enter admin password",
          variant: "destructive" 
        });
      }
    };
    
    const interval = setInterval(checkTimeout, 60000); // Check every minute
    
    const handleActivity = () => setLastActivityTime(Date.now());
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isAdminVerified, lastActivityTime, toast]);

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchMessages();
      fetchProfileSettings();
      fetchExperiences();
      fetchChatConversations();
    }
  }, [session]);

  const fetchProfileSettings = async () => {
    const { data, error } = await supabase
      .from("profile_settings")
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfileData({
        id: data.id,
        name: data.name,
        title: data.title,
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website || "",
        summary: data.summary,
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        image_url: data.image_url || "",
      });
    }
  };

  const fetchExperiences = async () => {
    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching experiences:", error);
    } else {
      setExperiences(data || []);
    }
  };

  const fetchChatConversations = async () => {
    const { data: conversations, error: convError } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (convError) {
      console.error("Error fetching conversations:", convError);
      return;
    }

    // Fetch messages for each conversation
    const conversationsWithMessages = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: messages } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });
        return { ...conv, messages: messages || [] };
      })
    );

    setChatConversations(conversationsWithMessages);
  };

  const handleDeleteConversation = async (id: string) => {
    // First delete all messages in the conversation
    await supabase.from("chat_messages").delete().eq("conversation_id", id);
    // Then delete the conversation
    const { error } = await supabase.from("chat_conversations").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conversation deleted!" });
      fetchChatConversations();
    }
  };

  const toggleConversationExpand = (id: string) => {
    setExpandedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMessages(data || []);
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

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expData = {
      title: expFormData.title,
      company: expFormData.company,
      period: expFormData.period,
      description: expFormData.description.split("\n").filter(Boolean),
      sort_order: editingExperience?.sort_order || experiences.length,
    };

    if (editingExperience) {
      const { error } = await supabase
        .from("experience")
        .update(expData)
        .eq("id", editingExperience.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Experience updated!" });
        fetchExperiences();
      }
    } else {
      const { error } = await supabase.from("experience").insert([expData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Experience added!" });
        fetchExperiences();
      }
    }

    resetExpForm();
    setIsExpDialogOpen(false);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    
    const profilePayload = {
      name: profileData.name,
      title: profileData.title,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      website: profileData.website,
      summary: profileData.summary,
      github_url: profileData.github_url,
      linkedin_url: profileData.linkedin_url,
      image_url: profileData.image_url,
    };

    if (profileData.id) {
      const { error } = await supabase
        .from("profile_settings")
        .update(profilePayload)
        .eq("id", profileData.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Profile updated!" });
        setIsProfileEditMode(false);
      }
    } else {
      const { data, error } = await supabase
        .from("profile_settings")
        .insert([profilePayload])
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setProfileData({ ...profileData, id: data.id });
        toast({ title: "Profile saved!" });
        setIsProfileEditMode(false);
      }
    }
    
    setSavingProfile(false);
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

  const handleDeleteExp = async (id: string) => {
    const { error } = await supabase.from("experience").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Experience deleted!" });
      fetchExperiences();
    }
  };

  // Drag and drop sensors and handler for experiences
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex((exp) => exp.id === active.id);
      const newIndex = experiences.findIndex((exp) => exp.id === over.id);

      const newOrder = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(newOrder);

      // Update sort_order in database
      const updates = newOrder.map((exp, index) => ({
        id: exp.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("experience")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }

      toast({ title: "Order updated!" });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message deleted!" });
      fetchMessages();
    }
  };

  const handleMarkAsRead = async (id: string, read: boolean) => {
    const { error } = await supabase.from("messages").update({ read: !read }).eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchMessages();
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

  const handleEditExp = (exp: Experience) => {
    setEditingExperience(exp);
    setExpFormData({
      title: exp.title,
      company: exp.company,
      period: exp.period,
      description: exp.description.join("\n"),
    });
    setIsExpDialogOpen(true);
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

  const resetExpForm = () => {
    setExpFormData({
      title: "",
      company: "",
      period: "",
      description: "",
    });
    setEditingExperience(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setProfileData({ ...profileData, image_url: urlData.publicUrl });
      localStorage.setItem("profileImageUrl", urlData.publicUrl);
      
      toast({ title: "Success!", description: "Profile image uploaded" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    setIsAdminVerified(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAdminPasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingPassword(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-password', {
        body: { password: adminPassword }
      });

      if (error) throw error;

      if (data.success) {
        setIsAdminVerified(true);
        toast({ title: "Access granted!" });
      } else {
        toast({ title: "Invalid password", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Error verifying admin password:', error);
      toast({ title: "Error", description: "Failed to verify password", variant: "destructive" });
    } finally {
      setVerifyingPassword(false);
      setAdminPassword("");
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Admin access password verification screen
  if (!isAdminVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass p-6 md:p-8 rounded-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
            <p className="text-muted-foreground">Enter the admin access password to continue</p>
          </div>
          
          <form onSubmit={handleAdminPasswordVerify} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter access password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              className="text-center"
            />
            <Button type="submit" className="w-full" disabled={verifyingPassword}>
              {verifyingPassword ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock
                </>
              )}
            </Button>
          </form>
          
          <Button variant="ghost" className="w-full mt-4" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <h1 className="text-base md:text-xl font-bold">Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-24 md:max-w-none">
                {session?.user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-4 md:mb-8 h-auto p-1">
            <TabsTrigger value="projects" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Experience</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm relative">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Chatbot</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold">Projects</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Manage your portfolio projects</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="w-full sm:w-auto">
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
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="description">Description *</Label>
                        <AIContentSuggestion
                          currentTitle={formData.title}
                          onSuggestion={(suggestion) => setFormData({ ...formData, description: suggestion })}
                        />
                      </div>
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

            {projects.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 px-4">
                  Add your first project to showcase your work
                </p>
                <Button variant="hero" size="sm" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Project
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="glass rounded-xl overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Code2 className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                        {project.featured && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full whitespace-nowrap">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(project)} className="flex-1 text-xs h-8">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="text-xs h-8">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
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

          {/* Experience Tab */}
          <TabsContent value="experience">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold">Experience</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Manage your work experience</p>
              </div>
              <Dialog open={isExpDialogOpen} onOpenChange={(open) => { setIsExpDialogOpen(open); if (!open) resetExpForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle>
                      {editingExperience ? "Edit Experience" : "Add New Experience"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleExpSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="exp_title">Job Title *</Label>
                      <Input
                        id="exp_title"
                        value={expFormData.title}
                        onChange={(e) => setExpFormData({ ...expFormData, title: e.target.value })}
                        placeholder="Full Stack Developer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp_company">Company *</Label>
                      <Input
                        id="exp_company"
                        value={expFormData.company}
                        onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                        placeholder="Company Name | Remote"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp_period">Period *</Label>
                      <Input
                        id="exp_period"
                        value={expFormData.period}
                        onChange={(e) => setExpFormData({ ...expFormData, period: e.target.value })}
                        placeholder="Jan 2023 - Present"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="exp_description">Description (one point per line) *</Label>
                        <AIExperienceSuggestion
                          jobTitle={expFormData.title}
                          company={expFormData.company}
                          onSuggestion={(suggestion) => setExpFormData({ ...expFormData, description: suggestion })}
                        />
                      </div>
                      <Textarea
                        id="exp_description"
                        value={expFormData.description}
                        onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                        placeholder="Developed web applications using React&#10;Built REST APIs with Node.js"
                        rows={5}
                        required
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button type="submit" variant="hero" className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        {editingExperience ? "Update" : "Add"} Experience
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setIsExpDialogOpen(false); resetExpForm(); }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {experiences.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Experience Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 px-4">
                  Add your work experience
                </p>
                <Button variant="hero" size="sm" onClick={() => setIsExpDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={experiences.map((exp) => exp.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <SortableExperienceItem
                        key={exp.id}
                        experience={exp}
                        onEdit={handleEditExp}
                        onDelete={handleDeleteExp}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsManager />
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="mb-6">
              <h2 className="text-lg md:text-2xl font-bold">Messages</h2>
              <p className="text-xs md:text-sm text-muted-foreground">View messages from contact form</p>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Messages from contact form will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`glass rounded-xl p-4 ${!msg.read ? 'border-l-4 border-primary' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{msg.name}</h3>
                          {!msg.read && (
                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">New</span>
                          )}
                        </div>
                        <a href={`mailto:${msg.email}`} className="text-xs text-primary hover:underline">
                          {msg.email}
                        </a>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(msg.id, msg.read)} className="text-xs h-8">
                        <Eye className="h-3 w-3 mr-1" />
                        {msg.read ? 'Unread' : 'Read'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="text-xs h-8">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chatbot Tab */}
          <TabsContent value="chatbot">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold">Chatbot Conversations</h2>
                <p className="text-xs md:text-sm text-muted-foreground">View and manage AI chatbot conversations</p>
              </div>
              <ChatExport conversations={chatConversations} />
            </div>

            {chatConversations.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Chatbot conversations will appear here once visitors start chatting
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatConversations.map((conv) => (
                  <div key={conv.id} className="glass rounded-xl overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleConversationExpand(conv.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Visitor: {conv.visitor_id.slice(0, 8)}...</p>
                            <p className="text-xs text-muted-foreground">
                              {conv.messages?.length || 0} messages • Last active: {new Date(conv.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this conversation and all its messages.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteConversation(conv.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {expandedConversations.has(conv.id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedConversations.has(conv.id) && conv.messages && conv.messages.length > 0 && (
                      <div className="border-t border-border p-4 bg-muted/30 max-h-80 overflow-y-auto">
                        <div className="space-y-3">
                          {conv.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(msg.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="mb-6">
              <h2 className="text-lg md:text-2xl font-bold">Visitor Analytics</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Track your website visitors</p>
            </div>
            <VisitorGraph />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold">Profile Settings</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Manage your profile information</p>
              </div>
              {!isProfileEditMode ? (
                <Button variant="hero" size="sm" onClick={() => setIsProfileEditMode(true)} className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="hero" size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="flex-1 sm:flex-none">
                    <Save className="h-4 w-4 mr-2" />
                    {savingProfile ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsProfileEditMode(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-4 md:p-6 space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 pb-6 border-b border-border">
                <div className="relative">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/20">
                    {profileData.image_url ? (
                      <img 
                        src={profileData.image_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  {isProfileEditMode ? (
                    <div className="space-y-2">
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Full Name"
                        className="font-semibold"
                      />
                      <Input
                        value={profileData.title}
                        onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                        placeholder="Job Title"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg">{profileData.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{profileData.title}</p>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Change Photo'}
                  </Button>
                </div>
              </div>

              {isProfileEditMode ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        type="email"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Location</Label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Website</Label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Summary</Label>
                    <Textarea
                      value={profileData.summary}
                      onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">GitHub URL</Label>
                      <Input
                        value={profileData.github_url}
                        onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">LinkedIn URL</Label>
                      <Input
                        value={profileData.linkedin_url}
                        onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <p className="font-medium mt-1 text-sm">{profileData.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Phone</Label>
                      <p className="font-medium mt-1 text-sm">{profileData.phone}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Location</Label>
                      <p className="font-medium mt-1 text-sm">{profileData.location}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Website</Label>
                      <p className="font-medium mt-1 text-sm">{profileData.website || "-"}</p>
                    </div>
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
                        <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="font-medium mt-1 text-sm text-primary hover:underline block truncate">
                          {profileData.github_url || "-"}
                        </a>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">LinkedIn</Label>
                        <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="font-medium mt-1 text-sm text-primary hover:underline block truncate">
                          {profileData.linkedin_url || "-"}
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
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;