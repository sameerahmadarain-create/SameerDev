import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

interface AdminPlaceholderPageProps {
  onNavigate: (href: string) => void;
}

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0d0907] text-white flex flex-col items-center justify-center p-6 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel-elevated border border-white/[0.1] text-center space-y-6 shadow-2xl shadow-black/80">
        <div className="w-14 h-14 mx-auto rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono text-sky-400">System Area</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Portal Reserved
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            This section is reserved for future portfolio project management and authentication.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-stone-400 text-left">
          <div className="text-stone-500">// Phase 1 Foundation Notice</div>
          <div className="text-amber-400">Status: Route registered (reserved)</div>
          <div className="text-stone-400">Auth &amp; Dashboard: Phase 4+</div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
