import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (href: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0d0907] text-white flex flex-col items-center justify-center p-6 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/[0.1] text-center space-y-6 shadow-2xl shadow-black/80">
        <div className="w-14 h-14 mx-auto rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
          <Compass className="w-7 h-7 text-sky-400" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono text-amber-400">404 Error</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl btn-micro-fx shadow-md shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
