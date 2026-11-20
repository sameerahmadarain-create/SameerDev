import React from 'react';
import { 
  Globe, 
  Smartphone, 
  Code2, 
  Briefcase, 
  Layers, 
  Wrench, 
  ShieldCheck 
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ServicesSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const services: ServiceItem[] = [
    {
      title: 'Website Development',
      description: 'Modern websites built for businesses, creators and individuals.',
      icon: Globe,
    },
    {
      title: 'Responsive Website Design',
      description: 'Interfaces that work smoothly across desktop, tablet and mobile.',
      icon: Smartphone,
    },
    {
      title: 'Web Application Development',
      description: 'Interactive web applications with modern user experiences.',
      icon: Code2,
    },
    {
      title: 'Business Websites',
      description: 'Professional websites designed to establish a strong online presence.',
      icon: Briefcase,
    },
    {
      title: 'UI Implementation',
      description: 'Converting designs and ideas into polished responsive interfaces.',
      icon: Layers,
    },
    {
      title: 'Website Bug Fixing & Improvements',
      description: 'Fixing issues and improving existing website experiences.',
      icon: Wrench,
    },
    {
      title: 'Website Maintenance',
      description: 'Ongoing updates, improvements and maintenance.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      id="services"
      ref={ref}
      className="scroll-mt-20 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative overflow-hidden"
      aria-label="Services"
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-amber-500/[0.03] rounded-full blur-[130px] pointer-events-none" 
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
              <span>What I Offer</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Services
            </h2>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
              Specialized web engineering solutions focused on clean development, responsiveness, and polished user interfaces.
            </p>
          </div>

          {/* Services Grid with staggered entrance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  style={{
                    transitionDelay: prefersReducedMotion ? '0ms' : `${index * 60}ms`,
                  }}
                  className={`group relative p-7 rounded-2xl bg-[#140e0b]/80 border border-white/[0.08] hover:border-sky-400/40 hover:bg-[#19110d] card-hover-fx hover:shadow-xl hover:shadow-black/70 flex flex-col justify-between ${
                    prefersReducedMotion || isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/25 group-hover:scale-110 group-hover:text-sky-300 transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-stone-500 group-hover:text-sky-400 transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-sky-200 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm text-stone-300 leading-relaxed">
                      {service.description}
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
