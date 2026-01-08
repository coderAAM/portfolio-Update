import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, Trash2, Edit, Eye, EyeOff, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  published: boolean;
  reading_time: number;
  created_at: string;
}

export function BlogManager() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    tags: "",
    published: false,
    reading_time: 5,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPosts(data || []);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      tags: "",
      published: false,
      reading_time: 5,
    });
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image || "",
      tags: post.tags.join(", "),
      published: post.published,
      reading_time: post.reading_time,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      cover_image: formData.cover_image || null,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      published: formData.published,
      reading_time: formData.reading_time,
    };

    if (editingPost) {
      const { error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", editingPost.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Post updated!" });
        fetchPosts();
      }
    } else {
      const { error } = await supabase.from("blog_posts").insert([postData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Post created!" });
        fetchPosts();
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deleted!" });
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: post.published ? "Post unpublished" : "Post published!" });
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl">
            <p className="text-muted-foreground">No blog posts yet. Create your first one!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="glass rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  {post.published ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                  <span>{post.reading_time} min read</span>
                  {post.tags.length > 0 && (
                    <span className="flex gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-primary/10 rounded text-primary">
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublish(post)}
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {post.published && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="View post"
                  >
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{post.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(post.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Post title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-url-slug"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here. Use markdown-like formatting:

## Heading 2
### Heading 3

> Blockquote

- List item 1
- List item 2

```code block```

Regular paragraphs..."
                rows={12}
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input
                  id="cover_image"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, JavaScript, Web Dev"
                />
              </div>
              <div>
                <Label htmlFor="reading_time">Reading Time (min)</Label>
                <Input
                  id="reading_time"
                  type="number"
                  value={formData.reading_time}
                  onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 5 })}
                  min={1}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
