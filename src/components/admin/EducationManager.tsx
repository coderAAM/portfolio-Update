import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, X, Check, GraduationCap } from "lucide-react";
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

interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  sort_order: number;
}

export const EducationManager = () => {
  const { toast } = useToast();
  const [education, setEducation] = useState<Education[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    period: "",
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching education:", error);
    } else {
      setEducation(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eduData = {
      degree: formData.degree,
      institution: formData.institution,
      period: formData.period,
      sort_order: editingEducation?.sort_order || education.length,
    };

    if (editingEducation) {
      const { error } = await supabase
        .from("education")
        .update(eduData)
        .eq("id", editingEducation.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Education updated!" });
        fetchEducation();
      }
    } else {
      const { error } = await supabase.from("education").insert([eduData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Education added!" });
        fetchEducation();
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("education").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Education deleted!" });
      fetchEducation();
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      degree: edu.degree,
      institution: edu.institution,
      period: edu.period,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      degree: "",
      institution: "",
      period: "",
    });
    setEditingEducation(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold">Education</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Manage your educational background</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingEducation ? "Edit Education" : "Add New Education"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="degree">Degree / Certificate *</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="B.S. in Computer Science"
                  required
                />
              </div>
              <div>
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="University Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="2020 - 2024"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" variant="hero" className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  {editingEducation ? "Update" : "Add"} Education
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

      {education.length === 0 ? (
        <div className="text-center py-12 glass rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Education Yet</h3>
          <p className="text-sm text-muted-foreground mb-4 px-4">
            Add your educational background
          </p>
          <Button variant="hero" size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{edu.degree}</h3>
                    <p className="text-xs text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-primary mt-1">{edu.period}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(edu)} className="text-xs h-8">
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
                        <AlertDialogTitle>Delete Education?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(edu.id)}>
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
    </div>
  );
};
