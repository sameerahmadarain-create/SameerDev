import React, { useState, useRef, useCallback } from 'react';
import { Code2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import heroSecondImg from '../../assets/images/hero_second_img.jpg';

const REMOTE_IMG_SRC = 'https://plain-eeur-prod-public.komododecks.com/202610/07/2vQwV0UtwznsnetcgVbv/image.jpg';

export const DeveloperPortrait3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(heroSecondImg);
  const [imageError, setImageError] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Controlled subtle tilt angles between -10 and +10 degrees
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  }, [prefersReducedMotion]);

  const handleMouseEnter = () => {
    if (!prefersReducedMotion) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleImgError = () => {
    if (currentSrc !== REMOTE_IMG_SRC) {
      setCurrentSrc(REMOTE_IMG_SRC);
    } else {
      setImageError(true);
    }
  };

  return (
    <div 
      className="relative select-none shrink-0 mb-2 sm:mb-0"
      style={{ perspective: '1000px' }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Sameer - Developer Portrait with 3D interaction"
    >
      {/* 3D Ambient Hologram Halo (Blue / Light-Blue with subtle amber glow) */}
      <div 
        className="absolute -inset-3 rounded-full bg-gradient-to-tr from-blue-600/35 via-sky-400/30 to-amber-500/15 blur-xl transition-all duration-500 pointer-events-none"
        style={{
          opacity: prefersReducedMotion ? 0.35 : isHovered ? 0.75 : 0.45,
          transform: prefersReducedMotion ? 'none' : `scale(${isHovered ? 1.08 : 1})`,
        }}
        aria-hidden="true"
      />

      {/* 3D Outer Rotating Orbit Ring with subtle red & yellow accents */}
      <div 
        className={`absolute -inset-2.5 rounded-full border border-sky-400/30 border-dashed pointer-events-none transition-opacity duration-300 ${
          prefersReducedMotion ? '' : 'animate-spin'
        }`}
        style={{
          animationDuration: '26s',
          transform: prefersReducedMotion ? 'none' : 'translateZ(-10px)',
        }}
        aria-hidden="true"
      >
        {/* Very subtle red secondary accent dot */}
        <span 
          className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" 
          aria-hidden="true" 
        />
        {/* Subtle yellow highlight dot */}
        <span 
          className="absolute bottom-1 left-2.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" 
          aria-hidden="true" 
        />
      </div>

      {/* Interactive 3D Card Container (Light-blue & subtle amber rim with dark brown depth) */}
      <div
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-[2px] bg-gradient-to-br from-sky-400 via-amber-400/70 to-blue-600 shadow-xl shadow-black/80 transition-transform duration-200 ease-out will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: prefersReducedMotion
            ? 'none'
            : isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.04)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
        }}
      >
        {/* Inner Portrait Frame (Dark-brown depth layer) */}
        <div 
          className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#16100d] flex items-center justify-center border border-white/15"
          style={{ transform: prefersReducedMotion ? 'none' : 'translateZ(20px)' }}
        >
          {!imageError ? (
            <img
              src={currentSrc}
              alt="Sameer - Professional Web Developer"
              className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
              referrerPolicy="no-referrer"
              onError={handleImgError}
            />
          ) : (
            /* Styled Fallback Container */
            <div className="w-full h-full bg-gradient-to-br from-[#1e1510] to-[#291d17] flex flex-col items-center justify-center text-sky-400 p-2 text-center">
              <Code2 className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-mono text-stone-200">SameerDev</span>
            </div>
          )}

          {/* 3D Specular Light Sheen */}
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none transition-all duration-200"
            style={{
              opacity: isHovered ? 1 : 0.25,
              transform: prefersReducedMotion ? 'none' : `translateX(${rotate.y * 1.5}px) translateY(${rotate.x * 1.5}px)`,
            }}
            aria-hidden="true"
          />
        </div>

        {/* 3D Floating Mini-Badge 1: Verified Developer (Dark brown base with light blue & red micro-dot) */}
        <div
          className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#1c130f] border border-sky-400/40 shadow-lg shadow-black/90 flex items-center gap-1.5 text-[10px] font-semibold text-white whitespace-nowrap transition-transform duration-200"
          style={{
            transform: prefersReducedMotion ? 'none' : 'translateZ(35px)',
          }}
        >
          <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
          <span className="tracking-wide">Dev</span>
        </div>

        {/* 3D Floating Mini-Badge 2: Yellow energetic highlight badge */}
        <div
          className="absolute -top-2 -left-2 w-6 h-6 rounded-lg bg-amber-400 border border-amber-300/60 shadow-md shadow-amber-500/25 flex items-center justify-center text-stone-950 font-bold transition-transform duration-200"
          style={{
            transform: prefersReducedMotion ? 'none' : 'translateZ(30px)',
          }}
          aria-hidden="true"
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-950" />
        </div>
      </div>
    </div>
  );
};
