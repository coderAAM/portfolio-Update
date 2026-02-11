import { useState, useMemo } from "react";
import { Mail, MapPin, Send, Github, Linkedin, MessageSquare, CheckCircle2 } from "lucide-react";
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
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [formSubmittedAt, setFormSubmittedAt] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormInteraction = () => {
    if (!formSubmittedAt) setFormSubmittedAt(Date.now());
  };

  const encodedEmail = useMemo(() => encodeEmail(PROFILE.email), []);
  const displayEmail = useMemo(() => obfuscateEmailDisplay(PROFILE.email), []);

  const handleEmailClick = () => {
    const email = decodeEmail(encodedEmail);
    if (email) window.location.href = `mailto:${email}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (honeypot) {
      toast({ title: "Message Sent!", description: "Thank you for reaching out. I'll get back to you soon!" });
      setFormData({ name: "", email: "", message: "" });
      return;
    }

    if (formSubmittedAt && Date.now() - formSubmittedAt < 3000) {
      toast({ title: "Message Sent!", description: "Thank you for reaching out. I'll get back to you soon!" });
      setFormData({ name: "", email: "", message: "" });
      return;
    }

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert([{
        name: result.data.name,
        email: result.data.email,
        message: result.data.message,
      }]);
      if (error) throw error;

      supabase.functions.invoke('send-contact-notification', {
        body: { name: result.data.name, email: result.data.email, message: result.data.message }
      }).then(({ error: emailError }) => {
        if (emailError) console.error("Email notification error:", emailError);
      });

      toast({ title: "Message Sent! ✨", description: "Thank you for reaching out. I'll get back to you soon!" });
      setFormData({ name: "", email: "", message: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Get In Touch</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Have a project in mind or want to collaborate? Feel free to reach out!
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <button
                onClick={handleEmailClick}
                className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer group p-3 rounded-lg hover:bg-muted transition-colors"
                data-email={encodedEmail}
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{displayEmail}</p>
                </div>
              </button>

              <div className="flex items-center gap-3 p-3">
                <div className="p-2 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{PROFILE.location}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">Connect with me</p>
                <div className="flex gap-2">
                  <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs">
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </Button>
                  </a>
                  <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs">
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative">
              {showSuccess && (
                <div className="absolute inset-0 bg-card/95 z-10 flex flex-col items-center justify-center rounded-lg animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative bg-primary rounded-full p-3">
                      <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold mt-4">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">I'll get back to you soon!</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" onFocus={handleFormInteraction}>
                <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input type="text" id="website" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                </div>

                <div>
                  <label htmlFor="name" className="block text-xs font-medium mb-1.5">Name</label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className={`text-sm ${errors.name ? 'border-destructive' : ''}`} />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium mb-1.5">Email</label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className={`text-sm ${errors.email ? 'border-destructive' : ''}`} />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium mb-1.5">Message</label>
                  <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Your message..." rows={4} className={`text-sm resize-none ${errors.message ? 'border-destructive' : ''}`} />
                  {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
                </div>

                <Button type="submit" size="sm" className="w-full rounded-full gap-2" disabled={loading}>
                  {loading ? "Sending..." : (
                    <>
                      Send Message
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
