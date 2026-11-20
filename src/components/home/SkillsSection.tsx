import React from 'react';
import { 
  Atom, 
  FileCode2, 
  FileJson, 
  Code, 
  Palette, 
  Wind, 
  Zap 
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Skill {
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SkillsSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const skills: Skill[] = [
    {
      name: 'React',
      category: 'Frontend Framework',
      description: 'Component-driven user interfaces, state management, and modern hooks architecture.',
      icon: Atom,
    },
    {
      name: 'TypeScript',
      category: 'Typed Language',
      description: 'Strict type safety, robust interface modeling, and enterprise reliability.',
      icon: FileCode2,
    },
    {
      name: 'JavaScript',
      category: 'Core Language',
      description: 'Modern ES6+ syntax, asynchronous programming, and DOM manipulation.',
      icon: FileJson,
    },
    {
      name: 'HTML5',
      category: 'Markup & Structure',
      description: 'Semantic document outlines, accessible landmarks, and SEO standards.',
      icon: Code,
    },
    {
      name: 'CSS3',
      category: 'Styling & Motion',
      description: 'Responsive design, Flexbox, Grid, transitions, and keyframe animations.',
      icon: Palette,
    },
    {
      name: 'Tailwind CSS',
      category: 'Utility Styling',
      description: 'Rapid UI engineering, design token systems, and responsive layouts.',
      icon: Wind,
    },
    {
      name: 'Vite',
      category: 'Build Tooling',
      description: 'Fast development server, optimized bundling, and modern build workflows.',
      icon: Zap,
    },
  ];

  return (
    <section
      id="skills"
      ref={ref}
      className="scroll-mt-20 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative overflow-hidden"
      aria-label="Skills"
    >
      {/* Ambient background light */}
      <div 
        className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-sky-500/[0.04] rounded-full blur-[130px] pointer-events-none" 
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
              <span>Technical Expertise</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Skills
            </h2>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
              Core technologies and tools actively used in production to build clean, maintainable, and responsive web applications.
            </p>
          </div>

          {/* Skills Grid with staggered entrance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {skills.map((skill, idx) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.name}
                  style={{
                    transitionDelay: prefersReducedMotion ? '0ms' : `${idx * 60}ms`,
                  }}
                  className={`group relative p-6 rounded-2xl bg-[#140e0b]/80 border border-white/[0.08] hover:border-sky-400/40 hover:bg-[#19110d] card-hover-fx hover:shadow-xl hover:shadow-black/70 flex flex-col justify-between ${
                    prefersReducedMotion || isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/25 group-hover:text-sky-300 transition-all duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono text-stone-400">
                        {skill.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                      {skill.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
