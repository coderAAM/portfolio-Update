import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, X, Check, GripVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
  sort_order: number;
}

interface SortableSkillItemProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
}

function SortableSkillItem({ skill, onEdit, onDelete }: SortableSkillItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 glass rounded-lg group"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{skill.name}</p>
        <p className="text-xs text-muted-foreground">
          {skill.level} • {skill.category === "languages" ? "Languages & Frameworks" : "Databases & Tools"}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={() => onEdit(skill)}>
          <Edit className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Skill?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{skill.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(skill.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function SkillsManager() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "Intermediate",
    category: "languages",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching skills:", error);
    } else {
      setSkills(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const skillData = {
      name: formData.name,
      level: formData.level,
      category: formData.category,
      sort_order: editingSkill?.sort_order || skills.length,
    };

    if (editingSkill) {
      const { error } = await supabase
        .from("skills")
        .update(skillData)
        .eq("id", editingSkill.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Skill updated!" });
        fetchSkills();
      }
    } else {
      const { error } = await supabase.from("skills").insert([skillData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Skill added!" });
        fetchSkills();
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Skill deleted!" });
      fetchSkills();
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      level: skill.level,
      category: skill.category,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", level: "Intermediate", category: "languages" });
    setEditingSkill(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((s) => s.id === active.id);
      const newIndex = skills.findIndex((s) => s.id === over.id);

      const newSkills = arrayMove(skills, oldIndex, newIndex);
      setSkills(newSkills);

      // Update sort_order in database
      const updates = newSkills.map((skill, index) => ({
        id: skill.id,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("skills")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
    }
  };

  const languageSkills = skills.filter((s) => s.category === "languages");
  const databaseSkills = skills.filter((s) => s.category === "databases");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-bold">Skills Management</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Add, edit, and reorder your skills</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Skill Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., React, Node.js, MongoDB"
                  required
                />
              </div>
              <div>
                <Label>Proficiency Level</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="languages">Languages & Frameworks</SelectItem>
                    <SelectItem value="databases">Databases & Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="hero" className="flex-1">
                  {editingSkill ? "Update" : "Add"} Skill
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 glass rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Skills Added</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your technical skills to display on your portfolio
          </p>
          <Button variant="hero" size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Skill
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-4 text-sm">Languages & Frameworks</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={languageSkills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {languageSkills.map((skill) => (
                    <SortableSkillItem
                      key={skill.id}
                      skill={skill}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                  {languageSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No skills in this category</p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-4 text-sm">Databases & Tools</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={databaseSkills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {databaseSkills.map((skill) => (
                    <SortableSkillItem
                      key={skill.id}
                      skill={skill}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                  {databaseSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No skills in this category</p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  );
}
