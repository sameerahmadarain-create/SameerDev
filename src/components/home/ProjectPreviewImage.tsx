import React, { useState } from 'react';
import { Project } from '../../types';
import { Globe, Lock, ExternalLink, Sparkles } from 'lucide-react';

interface ProjectPreviewImageProps {
  project: Project;
  large?: boolean;
}

export const ProjectPreviewImage: React.FC<ProjectPreviewImageProps> = ({
  project,
  large = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract clean hostname for the browser mockup address bar
  let displayDomain = 'sameerdev.product';
  if (project.url) {
    try {
      const urlObj = new URL(project.url);
      displayDomain = urlObj.hostname;
    } catch {
      displayDomain = project.url.replace(/^https?:\/\//, '') || 'sameerdev.product';
    }
  }

  // Determine thumbnail candidate if uploaded/custom URL or automatic website capture
  const candidateUrl =
    project.screenshot ||
    (project.screenshotSource === 'automatic' && project.url
      ? `https://api.microlink.io?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url`
      : undefined);

  const showFallback = imageError || !candidateUrl;

  return (
    <div className={`relative w-full overflow-hidden bg-[#160f0c] ${large ? 'aspect-[16/10]' : 'aspect-[16/10]'} select-none`}>
      {/* Browser Bar Mockup */}
      <div className="absolute top-0 inset-x-0 h-8 sm:h-9 bg-[#1a120e]/95 border-b border-white/[0.08] px-3.5 flex items-center justify-between z-20">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/85 inline-block shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400/85 inline-block shadow-[0_0_4px_rgba(56,189,248,0.4)]" />
        </div>

        {/* Address Bar Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0d0907]/90 border border-white/[0.06] text-[11px] font-mono text-stone-300 max-w-[65%] sm:max-w-[70%] truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{displayDomain}</span>
        </div>

        <div className="w-6 flex justify-end">
          <Globe className="w-3.5 h-3.5 text-stone-500" />
        </div>
      </div>

      {/* Main Image View or Premium Fallback */}
      <div className="pt-8 sm:pt-9 w-full h-full relative">
        {!showFallback ? (
          <>
            {/* Loading placeholder skeleton */}
            {!isLoaded && (
              <div className="absolute inset-0 pt-9 bg-gradient-to-br from-[#1a120e] via-[#221812] to-[#140e0b] animate-pulse flex items-center justify-center">
                <span className="text-xs font-mono text-stone-500">Loading website preview...</span>
              </div>
            )}
            <img
              src={candidateUrl}
              alt={`${project.name} live preview`}
              loading="lazy"
              className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          /* Polished Fallback Preview Card (Zero broken image, intentional design) */
          <div className="w-full h-full bg-gradient-to-br from-[#1b130f] via-[#251a14] to-[#120c09] p-6 flex flex-col justify-between relative overflow-hidden group-hover:brightness-105 transition-all">
            {/* Background cyber grid & glow */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              {project.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-sky-300 bg-sky-500/15 border border-sky-400/20">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  {project.category}
                </span>
              )}
              <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {project.name}
              </h4>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <div className="flex flex-wrap gap-1.5 max-w-[80%]">
                {project.technologies?.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.08] text-[10px] font-mono text-stone-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
