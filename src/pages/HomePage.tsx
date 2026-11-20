import React from 'react';
import { Hero } from '../components/home/Hero';
import { AboutSection } from '../components/home/AboutSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { SkillsSection } from '../components/home/SkillsSection';
import { ProjectsSection } from '../components/home/ProjectsSection';
import { ContactSection } from '../components/home/ContactSection';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/layout/BackToTop';

interface HomePageProps {
  onNavigate: (href: string) => void;
  currentHash: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentHash }) => {
  return (
    <div className="min-h-screen bg-[#0d0907] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar onNavigate={onNavigate} currentHash={currentHash} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with Video Background and 3D Developer Portrait */}
        <Hero onNavigate={onNavigate} />

        {/* Phase 2: About Section */}
        <AboutSection />

        {/* Phase 2: Services Section */}
        <ServicesSection />

        {/* Phase 2: Skills Section */}
        <SkillsSection />

        {/* Phase 3: Real Featured Projects Section */}
        <ProjectsSection
          onViewDetails={(projectId) => onNavigate(`/projects/${projectId}`)}
        />

        {/* Phase 2: Contact Section with WhatsApp Integration */}
        <ContactSection />
      </main>

      {/* Phase 2: Full Footer */}
      <Footer onNavigate={onNavigate} />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
};
