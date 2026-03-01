import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import InstallPWA from "@/components/InstallPWA";
import { AIChatbot } from "@/components/AIChatbot";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useEffect } from "react";
import { usePageVisit } from "@/hooks/usePageVisit";

const Index = () => {
  usePageVisit("/");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <ParticleBackground />
      <Navbar />
      <main className="overflow-x-hidden space-y-2 pb-8 relative z-10">
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <ThemeToggle />
      <InstallPWA />
      <AIChatbot />
    </div>
  );
};

export default Index;
