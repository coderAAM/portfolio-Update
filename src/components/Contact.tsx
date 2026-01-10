import { useState, useMemo } from "react";
import { Mail, MapPin, Send, Github, Linkedin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PROFILE, SOCIAL_LINKS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { encodeEmail, decodeEmail, obfuscateEmailDisplay } from "@/lib/email-obfuscation";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

export function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  // Obfuscated email for spam protection
  const encodedEmail = useMemo(() => encodeEmail(PROFILE.email), []);
  const displayEmail = useMemo(() => obfuscateEmailDisplay(PROFILE.email), []);

  const handleEmailClick = () => {
    const email = decodeEmail(encodedEmail);
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Save message to database
      const { error } = await supabase
        .from("messages")
        .insert([{
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
        }]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I'll get back to you soon!",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16 animate-fade-in">
          <p className="text-primary font-mono text-xs md:text-sm mb-2">{"<Contact />"}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-2">
            Have a project in mind or want to collaborate? Feel free to reach out!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6 md:space-y-8">
            <div className="glass rounded-xl md:rounded-2xl p-5 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <button
                  onClick={handleEmailClick}
                  className="flex items-start gap-4 group w-full text-left bg-transparent border-none cursor-pointer"
                  data-email={encodedEmail}
                >
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {displayEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Click to reveal & send</p>
                  </div>
                </button>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prefer a form?</p>
                    <p className="font-medium">
                      Use the contact form →
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">I'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-xl">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{PROFILE.location}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Follow Me</p>
                <div className="flex gap-4">
                  <a
                    href={SOCIAL_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 glass rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 glass rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass rounded-xl md:rounded-2xl p-5 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className={`bg-background/50 ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className={`bg-background/50 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your message..."
                  rows={5}
                  className={`bg-background/50 resize-none ${errors.message ? 'border-destructive' : ''}`}
                />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
