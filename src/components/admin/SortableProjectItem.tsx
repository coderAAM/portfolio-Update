import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface Props {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}

export const SortableProjectItem = ({ project, onEdit, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="glass rounded-xl overflow-hidden relative">
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded bg-background/80 backdrop-blur hover:bg-background touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {project.image_url ? (
        <img src={project.image_url} alt={project.title} className="w-full h-32 object-cover" />
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
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(project)} className="flex-1 text-xs h-8">
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
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(project.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
