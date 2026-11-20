import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { HeroVisual } from './HeroVisual';
import { DeveloperPortrait3D } from './DeveloperPortrait3D';
import { HeroVideoBackground } from './HeroVideoBackground';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import hero3dBg from '../../assets/images/hero_3d_bg.jpg';

interface HeroProps {
  onNavigate?: (href: string) => void;
}

const ROLES = [
  'Web Developer',
  'React Developer',
  'TypeScript Developer',
  'Modern Web Experiences',
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });
  const prefersReducedMotion = useReducedMotion();

  // Typing headline state
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(ROLES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(ROLES[0]);
      return;
    }

    const currentFullText = ROLES[roleIndex];
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting && displayedText === currentFullText) {
      // Pause at full text
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayedText === '') {
      // Move to next word after deleting
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    } else {
      // Typing or deleting characters
      const speed = isDeleting ? 40 : 80;
      timeoutId = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting
            ? currentFullText.substring(0, prev.length - 1)
            : currentFullText.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isDeleting, roleIndex, prefersReducedMotion]);

  const handleCtaClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else {
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  };

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden"
      aria-label="Introduction"
    >
      {/* Layer 1: Technology Developer Video Background */}
      <HeroVideoBackground />

      {/* Layer 2: Background ambient lighting (Blue & warm amber touches over dark brown) */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] bg-gradient-to-tr from-sky-500/[0.08] via-amber-500/[0.04] to-blue-600/[0.06] rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs with 3D Background on Dark Brown Base */}
          <div 
            className={`relative lg:col-span-7 p-6 sm:p-8 md:p-10 rounded-3xl border border-white/[0.12] bg-[#140e0b]/65 backdrop-blur-md shadow-2xl shadow-black/80 overflow-hidden transition-all duration-700 ease-out ${
              prefersReducedMotion || isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            {/* 3D Background Image */}
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0"
              aria-hidden="true"
            >
              <img 
                src={hero3dBg} 
                alt="" 
                className="w-full h-full object-cover object-center opacity-25 mix-blend-screen filter brightness-105 contrast-125"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://plain-eeur-prod-public.komododecks.com/202610/07/vJjy9kvsUfYxe828t5vN/image.jpg';
                }}
              />
              {/* Deep dark brown scrims tuned so background coding video remains clearly visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0907]/85 via-[#0d0907]/65 to-[#0d0907]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0907]/80 via-transparent to-[#0d0907]/40" />
              <div className="absolute -inset-px rounded-3xl border border-sky-500/25" />
            </div>

            <div className="relative z-10 space-y-7">
              
              {/* Entrance 1: Developer status tag - unboxed clean typography with subtle yellow accent */}
              <div 
                className={`inline-flex items-center gap-2 text-xs font-mono text-stone-300 transition-all duration-500 ${
                  prefersReducedMotion || isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" aria-hidden="true" />
                <span className="text-sky-300">Status:</span>
                <span>Available for new projects</span>
              </div>

              {/* Entrance 2: Primary Headline with 3D Man / Developer Portrait Animation */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                <span className="flex flex-wrap items-center gap-4 sm:gap-5 mb-3">
                  <DeveloperPortrait3D />
                  <span>Hi, I'm Sameer.</span>
                </span>
                
                {/* Rotating / Typing Role Text - Fixed layout container prevents any jitter */}
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 text-stone-300">
                  <span className="text-stone-400 font-normal">Specialized in: </span>
                  <span className="inline-flex items-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-amber-300">
                    <span>{displayedText}</span>
                    {!prefersReducedMotion && (
                      <span 
                        className="inline-block w-[2.5px] h-[0.9em] bg-amber-400 align-middle ml-1 rounded-sm animate-cursor" 
                        aria-hidden="true" 
                      />
                    )}
                  </span>
                </span>
              </h1>

              {/* Entrance 3: Supporting Text */}
              <p 
                className={`text-base sm:text-lg text-stone-200 font-normal leading-relaxed max-w-2xl transition-all duration-500 delay-100 ${
                  prefersReducedMotion || isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                I create modern, responsive and professional websites and web applications for businesses, creators and individuals.
              </p>

              {/* Entrance 4: Hero CTAs with refined button micro-interactions */}
              <div 
                className={`flex flex-wrap items-center gap-4 pt-2 transition-all duration-500 delay-150 ${
                  prefersReducedMotion || isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <a
                  href="#projects"
                  onClick={(e) => handleCtaClick('#projects', e)}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl btn-micro-fx shadow-lg shadow-blue-600/30 hover:shadow-blue-600/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0907]"
                >
                  <span>View My Work</span>
                  <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" />
                </a>

                <a
                  href="#contact"
                  onClick={(e) => handleCtaClick('#contact', e)}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 hover:border-amber-400/70 rounded-xl btn-micro-fx focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0907] shadow-sm hover:shadow-amber-400/20"
                >
                  <span>Hire Me</span>
                  <ArrowUpRight className="w-4 h-4 text-amber-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with staggered entrance */}
          <div 
            className={`lg:col-span-5 transition-all duration-700 delay-200 ease-out ${
              prefersReducedMotion || isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <HeroVisual />
          </div>

        </div>
      </div>
    </section>
  );
};
