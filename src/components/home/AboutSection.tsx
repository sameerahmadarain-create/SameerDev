import React from 'react';
import { Layout, Smartphone, MousePointerClick, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const AboutSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const focusPoints = [
    {
      title: 'Clean Interfaces',
      description: 'Structured layouts designed with clarity, visual hierarchy, and intuitive navigation.',
      icon: Layout,
    },
    {
      title: 'Responsive Experiences',
      description: 'Fluid designs crafted to adapt smoothly across mobile, tablet, and desktop screens.',
      icon: Smartphone,
    },
    {
      title: 'Useful Interactions',
      description: 'Purposeful interactive elements that provide meaningful feedback and clear actions.',
      icon: MousePointerClick,
    },
    {
      title: 'Polished Visual Details',
      description: 'Thoughtful typography, balanced spacing, and refined modern aesthetics.',
      icon: Sparkles,
    },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="scroll-mt-20 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative overflow-hidden"
      aria-label="About Sameer"
    >
      {/* Ambient background glow */}
      <div 
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-sky-500/[0.04] rounded-full blur-[120px] pointer-events-none" 
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
          {/* Section Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" aria-hidden="true" />
              <span>Developer Profile</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              About Sameer
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-stone-200 leading-relaxed font-normal">
              <p>
                I’m Sameer, a web developer focused on creating modern, responsive and professional websites and web applications.
              </p>
              <p className="text-stone-300">
                I care about clean interfaces, responsive experiences, useful interactions and polished visual details.
              </p>
            </div>
          </div>

          {/* Development Approach Cards with staggered transitions & micro-hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {focusPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  style={{
                    transitionDelay: prefersReducedMotion ? '0ms' : `${idx * 80}ms`,
                  }}
                  className={`group relative p-6 sm:p-7 rounded-2xl bg-[#140e0b]/80 border border-white/[0.08] hover:border-sky-400/40 hover:bg-[#19110d] card-hover-fx hover:shadow-xl hover:shadow-black/70 flex flex-col justify-between ${
                    prefersReducedMotion || isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/25 group-hover:text-sky-300 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-sky-200 transition-colors">
                      {point.title}
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed">
                      {point.description}
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
