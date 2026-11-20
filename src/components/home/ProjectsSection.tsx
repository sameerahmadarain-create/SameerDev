import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { projectService } from '../../services';
import { ProjectCard } from './ProjectCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ProjectsSectionProps {
  onViewDetails: (projectId: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onViewDetails }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });
  const prefersReducedMotion = useReducedMotion();
  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());

  useEffect(() => {
    const unsubscribe = projectService.subscribeProjects(
      (cloudItems) => {
        setProjects(cloudItems);
      },
      () => {
        setProjects(projectService.getProjects());
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <section
      id="projects"
      ref={ref}
      className="scroll-mt-20 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative overflow-hidden"
      aria-label="Featured Projects"
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/[0.04] via-amber-500/[0.03] to-transparent rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div 
          className={`space-y-12 transition-all duration-700 ease-out ${
            prefersReducedMotion || isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" aria-hidden="true" />
              <span>Production Portfolio</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Featured Projects
            </h2>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
              Explore real live websites and web applications designed and developed by Sameer, showcasing modern interfaces, responsiveness, and clean code.
            </p>
          </div>

          {/* Projects Responsive Grid with staggered cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                style={{
                  transitionDelay: prefersReducedMotion ? '0ms' : `${idx * 70}ms`,
                }}
                className={`transition-all duration-500 ${
                  prefersReducedMotion || isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <ProjectCard
                  project={project}
                  onViewDetails={onViewDetails}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
