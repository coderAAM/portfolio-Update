import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, ArrowLeft, Tag, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  reading_time: number;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-64 bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <Tag className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you are looking for does not exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse markdown-like content to HTML
  const formatContent = (content: string) => {
    return content
      .split("\n\n")
      .map((paragraph, index) => {
        // Headings
        if (paragraph.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-8 mb-4">
              {paragraph.replace("### ", "")}
            </h3>
          );
        }
        if (paragraph.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-10 mb-4">
              {paragraph.replace("## ", "")}
            </h2>
          );
        }
        if (paragraph.startsWith("# ")) {
          return (
            <h1 key={index} className="text-3xl font-bold mt-12 mb-6">
              {paragraph.replace("# ", "")}
            </h1>
          );
        }

        // Code blocks
        if (paragraph.startsWith("```")) {
          const code = paragraph.replace(/```\w*\n?/g, "").trim();
          return (
            <pre
              key={index}
              className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto my-6 text-sm"
            >
              <code>{code}</code>
            </pre>
          );
        }

        // Blockquotes
        if (paragraph.startsWith("> ")) {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6"
            >
              {paragraph.replace("> ", "")}
            </blockquote>
          );
        }

        // Lists
        if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
          const items = paragraph.split("\n- ").filter(Boolean);
          return (
            <ul key={index} className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
              {items.map((item, i) => (
                <li key={i}>{item.replace("- ", "")}</li>
              ))}
            </ul>
          );
        }

        // Regular paragraphs
        return (
          <p key={index} className="text-muted-foreground leading-relaxed my-4">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-8 animate-fade-in">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Ahmed Ali
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.created_at), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.reading_time} min read
              </span>
            </div>
          </header>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="mb-10 rounded-2xl overflow-hidden animate-fade-in">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none animate-fade-in">
            {formatContent(post.content)}
          </div>

          {/* Share & Navigation */}
          <footer className="mt-16 pt-8 border-t border-border">
            <div className="flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Articles
                </Link>
              </Button>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
