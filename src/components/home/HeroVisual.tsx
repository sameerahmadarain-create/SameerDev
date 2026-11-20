import React from 'react';
import { Terminal, Sparkles, Layers, ShieldCheck, Cpu } from 'lucide-react';

export const HeroVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
      {/* Background ambient glow behind visual */}
      <div 
        className="absolute -inset-4 bg-gradient-to-tr from-sky-500/20 via-blue-600/15 to-amber-500/15 rounded-3xl blur-2xl opacity-60 animate-pulse-glow"
        aria-hidden="true" 
      />

      {/* Main Glassmorphic Code Frame */}
      <div className="relative rounded-2xl glass-panel-elevated shadow-2xl shadow-black/80 overflow-hidden border border-white/[0.12] transition-all duration-300 hover:border-sky-400/40 hover:shadow-sky-500/10">
        
        {/* Editor Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#18110d]/95 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/85 inline-block shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
            <span className="w-3 h-3 rounded-full bg-amber-400/90 inline-block shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
            <span className="w-3 h-3 rounded-full bg-sky-400/90 inline-block shadow-[0_0_6px_rgba(56,189,248,0.4)]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>ModernApp.tsx</span>
          </div>
          <div className="w-12 text-right">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          </div>
        </div>

        {/* Code Body */}
        <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-stone-200">
          <div className="flex gap-4">
            {/* Line numbers */}
            <div className="select-none text-stone-600 text-right pr-2 border-r border-stone-800 space-y-1">
              <div>01</div>
              <div>02</div>
              <div>03</div>
              <div>04</div>
              <div>05</div>
              <div>06</div>
              <div>07</div>
              <div>08</div>
              <div>09</div>
              <div>10</div>
            </div>

            {/* Code lines */}
            <div className="space-y-1 flex-1">
              <div>
                <span className="text-sky-400">interface</span>{' '}
                <span className="text-amber-200">ProductionBuild</span>{' '}
                <span className="text-stone-400">{'{'}</span>
              </div>
              <div className="pl-4">
                <span className="text-stone-300">stack</span>
                <span className="text-stone-500">:</span>{' '}
                <span className="text-sky-300">['React', 'TypeScript', 'Tailwind']</span>
                <span className="text-stone-500">;</span>
              </div>
              <div className="pl-4">
                <span className="text-stone-300">performance</span>
                <span className="text-stone-500">:</span>{' '}
                <span className="text-amber-300">'Sub-second Core Web Vitals'</span>
                <span className="text-stone-500">;</span>
              </div>
              <div className="pl-4">
                <span className="text-stone-300">responsive</span>
                <span className="text-stone-500">:</span>{' '}
                <span className="text-amber-400">true</span>
                <span className="text-stone-500">;</span>
              </div>
              <div>
                <span className="text-stone-400">{'}'}</span>
              </div>
              <div>&nbsp;</div>
              <div>
                <span className="text-sky-400">export const</span>{' '}
                <span className="text-amber-300">engineerProject</span>{' '}
                <span className="text-stone-400">=</span>{' '}
                <span className="text-sky-400">async</span>{' '}
                <span className="text-stone-400">() =&gt; {'{'}</span>
              </div>
              <div className="pl-4">
                <span className="text-sky-400">return</span>{' '}
                <span className="text-sky-300">deploy</span>
                <span className="text-stone-400">({'{'}</span>{' '}
                <span className="text-stone-300">quality</span>
                <span className="text-stone-500">:</span>{' '}
                <span className="text-amber-200">'Flawless'</span>{' '}
                <span className="text-stone-400">{'}'})</span>
                <span className="text-stone-500">;</span>
              </div>
              <div>
                <span className="text-stone-400">{'}'};</span>
              </div>
              <div className="flex items-center text-stone-500">
                <span className="text-sky-400 pr-1">// Ready for production</span>
                <span className="inline-block w-2 h-4 bg-sky-400 ml-1 animate-cursor" />
              </div>
            </div>
          </div>
        </div>

        {/* Status / Output Footer */}
        <div className="px-5 py-3 bg-[#18110d]/95 border-t border-white/[0.08] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="text-stone-300 font-medium">Type Checked</span>
            <span className="text-stone-600">·</span>
            <span className="text-amber-400">Zero Errors</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Vite Ready</span>
          </div>
        </div>
      </div>

      {/* Floating Auxiliary Accent Card */}
      <div 
        className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 hidden sm:flex items-center gap-3 p-3.5 rounded-xl glass-panel border border-white/[0.12] shadow-xl shadow-black/80 animate-float"
      >
        <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">Full-Stack Architecture</div>
          <div className="text-[11px] text-stone-400">Clean &amp; Scalable Codebase</div>
        </div>
      </div>

      {/* Floating Performance Indicator */}
      <div 
        className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a120e]/90 border border-amber-400/35 shadow-lg shadow-black/60"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-medium text-amber-200">100% Responsive</span>
      </div>
    </div>
  );
};
